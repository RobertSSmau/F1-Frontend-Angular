export * from './cars.service';
import { CarsService } from './cars.service';
export * from './championships.service';
import { ChampionshipsService } from './championships.service';
export * from './drivers.service';
import { DriversService } from './drivers.service';
export * from './teams.service';
import { TeamsService } from './teams.service';
export const APIS = [CarsService, ChampionshipsService, DriversService, TeamsService];
