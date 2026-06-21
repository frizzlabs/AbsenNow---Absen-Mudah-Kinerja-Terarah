<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['organization_id', 'name', 'latitude', 'longitude', 'radius_meters', 'work_start', 'work_end'])]
class Office extends Model
{
    use HasFactory, BelongsToOrganization;

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
