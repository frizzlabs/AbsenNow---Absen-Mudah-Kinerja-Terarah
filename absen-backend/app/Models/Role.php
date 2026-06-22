<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['organization_id', 'name', 'label', 'description', 'is_system'];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(RolePermission::class, 'permission_role', 'role_id', 'role_permission_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission(string $name): bool
    {
        if ($this->name === 'superadmin' || $this->name === 'org_admin') {
            return true;
        }
        return $this->permissions->contains('name', $name);
    }
}
