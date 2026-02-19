<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

/**
 * Деплой: коммит и push в git, затем по SSH на сервере — pull, миграции, сборка admin/frontend/calc, сброс кэша.
 * Опция --local: выполнить те же шаги (миграции, сборки, кэш) только локально, без git и SSH.
 * Настройка: .env — DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SERVER_PATH, DEPLOY_BRANCH.
 */
class DeployCommand extends Command
{
    protected $signature = 'deploy
                            {--message= : Сообщение коммита}
                            {--no-commit : Не коммитить и не пушить (только сервер)}
                            {--server-only : Только выполнить команды на сервере, без git}
                            {--local : Полный деплой локально: миграции, сборка admin/frontend/calc, сброс и кэш (без git и SSH)}
                            {--dry-run : Показать команды, не выполнять}';

    protected $description = 'Full deploy: git push + server (or --local): migrate, composer/npm install, build admin & frontend & calc, clear/cache';

    public function handle(): int
    {
        if ($this->option('local')) {
            return $this->runLocalDeploy();
        }

        $branch = config('deploy.branch', 'main');
        $path = config('deploy.server_path');
        $commands = config('deploy.server_commands', []);
        $serverScript = implode(' && ', array_map(function ($cmd) use ($path, $branch) {
            return str_replace(['{path}', '{branch}'], [$path, $branch], $cmd);
        }, $commands));

        if ($this->option('dry-run')) {
            $this->info('--- Git (локально) ---');
            if (! $this->option('server-only')) {
                $this->line('git add -A');
                $this->line('git commit -m "..."');
                $this->line("git push origin {$branch}");
            }
            $this->info('--- Сервер (SSH) ---');
            $this->line($serverScript);
            return self::SUCCESS;
        }

        if (! $this->option('server-only')) {
            $this->info('Git: добавление и коммит...');
            $add = Process::run('git add -A');
            if (! $add->successful()) {
                $this->error('git add -A failed: ' . $add->errorOutput());
                return self::FAILURE;
            }

            $status = Process::run('git status --short');
            if (trim($status->output()) === '') {
                $this->comment('Нет изменений для коммита.');
            } else {
                $message = $this->option('message') ?: 'Deploy: ' . date('Y-m-d H:i');
                $commit = Process::run(['git', 'commit', '-m', $message]);
                if (! $commit->successful()) {
                    $this->error('git commit failed: ' . $commit->errorOutput());
                    return self::FAILURE;
                }
                $this->info('Коммит создан: ' . $message);
            }

            if (! $this->option('no-commit')) {
                $this->info('Git: отправка на origin...');
                $push = Process::run("git push origin {$branch}");
                if (! $push->successful()) {
                    $this->error('git push failed: ' . $push->output() . $push->errorOutput());
                    return self::FAILURE;
                }
                $this->info('Push выполнен.');
            }
        }

        $host = config('deploy.ssh_host');
        $user = config('deploy.ssh_user');
        if ($host === '' || $host === null) {
            $this->warn('DEPLOY_SSH_HOST не задан в .env. Пропуск шагов на сервере.');
            return self::SUCCESS;
        }

        $sshTarget = $user ? "{$user}@{$host}" : $host;
        $fullCommand = "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 {$sshTarget} " . escapeshellarg($serverScript);

        $this->info('Сервер: обновление и сборка...');
        $result = Process::timeout(600)->run($fullCommand);

        if ($result->successful()) {
            $this->info('Деплой завершён.');
            if (trim($result->output())) {
                $this->line($result->output());
            }
            return self::SUCCESS;
        }

        $this->error('Ошибка на сервере:');
        $this->line($result->output());
        $this->line($result->errorOutput());
        return self::FAILURE;
    }

    /**
     * Полный деплой локально: миграции, composer, сборка admin (root), frontend (React), calc, сброс и кэш.
     */
    protected function runLocalDeploy(): int
    {
        $base = base_path();

        $steps = [
            'Composer install' => ['composer', 'install', '--no-dev', '--optimize-autoloader'],
            'Миграции' => ['php', 'artisan', 'migrate', '--force'],
            'Admin (Vite) npm install' => ['npm', 'install', '--legacy-peer-deps'],
            'Admin (Vite) build' => ['npm', 'run', 'build'],
            'Frontend (React) build' => null,
            'Calc build и копирование в public/calc' => null,
            'Laravel cache' => null,
        ];

        foreach ($steps as $label => $cmd) {
            if (is_array($cmd)) {
                $this->info("{$label}...");
                $r = Process::timeout(300)->path($base)->run($cmd);
                if (! $r->successful()) {
                    $this->error("{$label} failed: " . $r->errorOutput() ?: $r->output());
                    return self::FAILURE;
                }
                continue;
            }

            if ($label === 'Frontend (React) build') {
                $this->info("{$label}...");
                $frontDir = $base . DIRECTORY_SEPARATOR . 'frontend';
                if (! is_dir($frontDir)) {
                    $this->warn('Папка frontend не найдена, пропуск.');
                    continue;
                }
                $r = Process::timeout(300)->path($frontDir)->run('npm install --legacy-peer-deps');
                if (! $r->successful()) {
                    $this->error("{$label} (npm install) failed: " . ($r->errorOutput() ?: $r->output()));
                    return self::FAILURE;
                }
                $r = Process::timeout(300)->path($frontDir)->run('npm run build');
                if (! $r->successful()) {
                    $this->error("{$label} (npm run build) failed: " . ($r->errorOutput() ?: $r->output()));
                    return self::FAILURE;
                }
                continue;
            }

            if ($label === 'Calc build и копирование в public/calc') {
                $calcDir = $base . DIRECTORY_SEPARATOR . 'calc';
                $publicCalc = $base . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'calc';
                if (! is_dir($calcDir) || ! is_file($calcDir . DIRECTORY_SEPARATOR . 'package.json')) {
                    $this->warn('Калькулятор (calc/) не найден, пропуск.');
                    continue;
                }
                $this->info("{$label}...");
                $r = Process::timeout(300)->path($calcDir)->run('npm install --legacy-peer-deps');
                if (! $r->successful()) {
                    $this->error("Calc npm install failed: " . ($r->errorOutput() ?: $r->output()));
                    return self::FAILURE;
                }
                $r = Process::timeout(300)->path($calcDir)->run('npm run build');
                if (! $r->successful()) {
                    $this->error("Calc npm run build failed: " . ($r->errorOutput() ?: $r->output()));
                    return self::FAILURE;
                }
                $distDir = $calcDir . DIRECTORY_SEPARATOR . 'dist';
                $calcPublic = $calcDir . DIRECTORY_SEPARATOR . 'public';
                if (is_dir($publicCalc)) {
                    File::deleteDirectory($publicCalc);
                }
                File::ensureDirectoryExists($publicCalc);
                if (is_dir($distDir)) {
                    File::copyDirectory($distDir, $publicCalc);
                }
                if (is_dir($calcPublic)) {
                    File::copyDirectory($calcPublic, $publicCalc);
                }
                continue;
            }

            if ($label === 'Laravel cache') {
                $this->info('Сброс и кэш Laravel...');
                foreach (['config:clear', 'config:cache', 'route:clear', 'route:cache', 'view:clear', 'view:cache', 'optimize'] as $artCmd) {
                    $r = Process::timeout(60)->path($base)->run(['php', 'artisan', $artCmd]);
                    if (! $r->successful()) {
                        $this->error("php artisan {$artCmd} failed: " . ($r->errorOutput() ?: $r->output()));
                        return self::FAILURE;
                    }
                }
                $this->info('Деплой (локальный) завершён.');
                return self::SUCCESS;
            }
        }

        return self::SUCCESS;
    }
}
