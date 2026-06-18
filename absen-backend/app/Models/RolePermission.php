<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RolePermission extends Model
{
    protected $table = 'role_permissions';

    protected $fillable = ['name', 'module', 'action', 'module_label', 'action_label'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role', 'role_permission_id', 'role_id');
    }
}
