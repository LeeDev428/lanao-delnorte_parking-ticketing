<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DropAllTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:drop-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Drop all tables in the database (force drop)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->confirm('This will drop ALL tables. Are you sure?')) {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        $tables = DB::select('SHOW TABLES');
        $dbName = 'Tables_in_' . config('database.connections.mysql.database');
        
        foreach ($tables as $table) {
            $tableName = $table->$dbName;
            DB::statement("DROP TABLE IF EXISTS `{$tableName}`");
            $this->info("Dropped: {$tableName}");
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        $this->info('All tables dropped successfully!');
    }
}
