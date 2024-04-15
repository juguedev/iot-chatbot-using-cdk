# GREENGRASS COMPONENT TO SEND DATA TO THE CLOUD WITH PAHO MQTT

This is a greengrass component that uses a raspberry and DHT11 sensor that measures temperature and humidity.

## Configure .env

There is an .env.example template where you must define the broker endpoint and port.

```
BROKER_ADDRESS=
BROKER_PORT=
```

## Configure cli-deployment.json

There is a cli-deployment.example.json template where you must define the configuration to deploy the components with the following command.

```
aws greengrassv2 create-deployment --cli-input-json file://cli-deployment.json
```

It's important to define the following configuration:

- targetArtn: ARN thing group
- deploymentName: Name for deployment
- components: Set of component to deploy
