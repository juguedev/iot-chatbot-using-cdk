interface Environment {
	region: string;
	project: string;
	environment: string;
	accountId: string;
	tblName: string;
}

export const environments: { [key: string]: Environment } = {
	dev: {
		region: 'us-east-1',
		project: 'iot_chatbot',
		environment: 'dev',
		accountId: '539548017896',
		tblName: 'tbl_measures',
	},

	prod: {
		region: 'us-east-1',
		project: 'iot_chatbot',
		environment: 'prod',
		accountId: '539548017896',
		tblName: 'tbl_measures',
	},
};
