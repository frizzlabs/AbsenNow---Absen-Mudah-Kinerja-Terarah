<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'email', 'password', 'otp', 'otp_expires_at', 'otp_attempts', 'password_reset_token', 'password_reset_expires_at', 'device_pin',
    'employee_id', 'job_title', 'department', 'date_of_birth', 'gender',
    'phone', 'personal_email', 'address',
    'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
    'avatar_url', 'role_id', 'position',
])]
#[Hidden(['password', 'remember_token', 'device_pin'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date:Y-m-d',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class);
    }

    public function role(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function isSuperadmin(): bool
    {
        return $this->role && $this->role->name === 'superadmin';
    }

    public function hasPermission(string $name): bool
    {
        if (!$this->role) {
            return false;
        }
        return $this->role->hasPermission($name);
    }

    /** Daftar nama permission yang dimiliki user (untuk gating UI). */
    public function permissionNames(): array
    {
        if (!$this->role) {
            return [];
        }
        if ($this->role->name === 'superadmin') {
            return RolePermission::pluck('name')->all();
        }
        return $this->role->permissions->pluck('name')->all();
    }
}
