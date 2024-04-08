import { environments } from '../bin/environments';

const { project, region, environment } = environments['dev'];

export const createName = (resource: string, functionality: string) =>
	`${project}_${resource}_${environment}_${functionality}`;
