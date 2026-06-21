<?php
namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function __construct(private TenantContext $tenant) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Platform super-admin is org-less and bypasses scoping.
        if ($user && $user->organization_id !== null) {
            $this->tenant->set((int) $user->organization_id);
        }

        return $next($request);
    }
}
