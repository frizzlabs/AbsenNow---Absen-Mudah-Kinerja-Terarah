<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'user_id',
        'title',
        'category',
        'permission_date',
        'start_time',
        'end_time',
        'duration_hours',
        'notes',
        'attachment_path',
        'status',
    ];

    protected $casts = [
        'permission_date' => 'date:Y-m-d',
        'duration_hours' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
