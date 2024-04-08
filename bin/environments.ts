interface Environment {
	region: string;
	project: string;
	environment: string;
	accountId: string;
	tblName: string;
	dbUser: string;
}

export const environments: { [key: string]: Environment } = {
	dev: {
		region: 'us-east-2',
		project: 'iot_chatbot',
		environment: 'dev',
		accountId: '884162918988',
		tblName: 'tbl_measures',
		dbUser: 'root',
	},

	prod: {
		region: 'us-east-2',
		project: 'iot_chatbot',
		environment: 'prod',
		accountId: '884162918988',
		tblName: 'tbl_measures',
		dbUser: 'root',
	},
};
