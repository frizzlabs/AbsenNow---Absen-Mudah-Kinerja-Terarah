<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kpi extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'user_id',
        'period',
        'title',
        'description',
        'status',
        'weight',
        'target_label',
        'current_label',
        'achievement_percent',
        'last_updated',
        'manager_note',
    ];

    protected $casts = [
        'last_updated' => 'date:Y-m-d',
        'weight' => 'integer',
        'achievement_percent' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(KpiHistory::class)->orderBy('event_date', 'desc');
    }
}
