<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminMenu;
use Illuminate\Http\Request;

class AdminMenuController extends Controller
{
    public function __construct(
        protected AdminMenu $adminMenu
    ) {}

    public function index(Request $request)
    {
        $menu = $this->adminMenu->getMenuJson($request->user());
        return response()->json(['menu' => $menu]);
    }
}
