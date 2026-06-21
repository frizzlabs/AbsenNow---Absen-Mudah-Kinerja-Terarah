<?php
namespace App\Models\Concerns;

use App\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            $ctx = app(TenantContext::class);
            if ($ctx->hasTenant()) {
                $builder->where($builder->getModel()->getTable() . '.organization_id', $ctx->id());
            }
        });

        static::creating(function (Model $model) {
            $ctx = app(TenantContext::class);
            if ($ctx->hasTenant() && empty($model->organization_id)) {
                $model->organization_id = $ctx->id();
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Organization::class);
    }
}
