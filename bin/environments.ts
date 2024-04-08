interface Environment {
	region: string;
	project: string;
	environment: string;
	dbName: string;
	dbUser: string;
}

export const environments: { [key: string]: Environment } = {
	dev: {
		region: 'us-east-2',
		project: 'chatbot-iot',
		environment: 'dev',
		dbName: 'measures',
		dbUser: 'root',
	},

	prod: {
		region: 'us-east-2',
		project: 'chatbot-iot',
		environment: 'prod',
		dbName: 'measures',
		dbUser: 'root',
	},
};
