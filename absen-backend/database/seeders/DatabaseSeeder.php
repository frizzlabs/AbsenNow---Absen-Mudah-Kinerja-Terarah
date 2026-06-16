<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Office;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Test User
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Seed Office
        Office::firstOrCreate(
            ['name' => 'Karajo HQ - Tech Park'],
            [
                'latitude' => -6.200000,
                'longitude' => 106.816666,
                'radius_meters' => 50,
            ]
        );
    }
}
