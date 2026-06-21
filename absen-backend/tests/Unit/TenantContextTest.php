<?php
namespace Tests\Unit;

use App\Support\TenantContext;
use Tests\TestCase;

class TenantContextTest extends TestCase
{
    public function test_holds_and_clears_organization_id(): void
    {
        $ctx = new TenantContext();
        $this->assertNull($ctx->id());
        $this->assertFalse($ctx->hasTenant());

        $ctx->set(7);
        $this->assertSame(7, $ctx->id());
        $this->assertTrue($ctx->hasTenant());

        $ctx->clear();
        $this->assertNull($ctx->id());
    }
}
