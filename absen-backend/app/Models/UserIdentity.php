<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserIdentity extends Model
{
    protected $fillable = [
        'user_id', 'id_type', 'id_number', 'id_name',
        'id_expiry', 'photo_front_path', 'photo_back_path',
        'status', 'admin_note',
    ];

    protected $casts = [
        'id_expiry' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getPhotoFrontUrlAttribute(): ?string
    {
        return $this->photo_front_path ? asset('storage/' . $this->photo_front_path) : null;
    }

    public function getPhotoBackUrlAttribute(): ?string
    {
        return $this->photo_back_path ? asset('storage/' . $this->photo_back_path) : null;
    }
}
