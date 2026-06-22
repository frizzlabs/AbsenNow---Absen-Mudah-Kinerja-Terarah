<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;

class DinasLuarAttendance extends Model
{
    use BelongsToOrganization;

    protected $table = 'dinas_luar_attendances';

    protected $fillable = [
        'organization_id',
        'dinas_luar_id', 'user_id', 'latitude', 'longitude',
        'geofence_valid', 'work_report', 'evidence_path',
    ];

    protected $casts = [
        'latitude'       => 'float',
        'longitude'      => 'float',
        'geofence_valid' => 'boolean',
    ];

    public function dinasLuar() { return $this->belongsTo(DinasLuar::class, 'dinas_luar_id'); }
    public function user()      { return $this->belongsTo(User::class); }
}
