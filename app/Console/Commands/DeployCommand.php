<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

/**
 * Деплой: коммит и push в git, затем по SSH на сервере — pull, миграции, сборка админки и фронта, сброс кэша.
 * Настройка: .env — DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SERVER_PATH, DEPLOY_BRANCH.
 */
class DeployCommand extends Command
{
    protected $signature = 'deploy
                            {--message= : Сообщение коммита}
                            {--no-commit : Не коммитить и не пушить (только сервер)}
                            {--server-only : Только выполнить команды на сервере, без git}
                            {--dry-run : Показать команды, не выполнять}';

    protected $description = 'Commit, push, then on server: git pull, migrate, npm/composer install, build admin & frontend, clear cache';

    public function handle(): int
    {
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
}
