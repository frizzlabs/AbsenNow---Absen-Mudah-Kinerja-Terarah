<?php
namespace App\Support;

class TenantContext
{
    private ?int $organizationId = null;

    public function set(?int $organizationId): void
    {
        $this->organizationId = $organizationId;
    }

    public function id(): ?int
    {
        return $this->organizationId;
    }

    public function hasTenant(): bool
    {
        return $this->organizationId !== null;
    }

    public function clear(): void
    {
        $this->organizationId = null;
    }
}
