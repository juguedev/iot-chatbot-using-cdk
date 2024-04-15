#!/usr/bin/python
import Adafruit_DHT
import paho.mqtt.client as mqtt
import paho.mqtt.enums as mqtt_enum
import random
import ssl
import json
from decouple import config
from time import sleep
from datetime import datetime

def data_processing():
    # MQTT broker configuration
    broker_address = config("BROKER_ADDRESS", cast=str)  # Replace with your MQTT broker address
    broker_port = config("BROKER_PORT", cast=int)  # Default MQTT port
    rootCa = "/greengrass/v2/rootCA.pem"
    thingCert = "/greengrass/v2/thingCert.crt"
    privKey = "/greengrass/v2/privKey.key"

    sensor = Adafruit_DHT.DHT11
    topic = 'raspberry/sensor'
    device = "raspberry"

    # connected to GPIO4.
    pin = 4

    # Callback function to handle connection established event
    def on_connect(client, userdata, flags, rc):
        print("Connected to MQTT broker with result code "+str(rc))
        # Subscribe to the input topic
        client.subscribe(topic)

    # Callback function to handle message received event
    def on_message(client, userdata, msg):
        print(f"Received message on topic {msg.topic}: {msg.payload.decode()}")

    # Create MQTT client instance
    client_id = f'python-mqtt-{random.randint(0, 1000)}'
    client = mqtt.Client(callback_api_version=mqtt_enum.CallbackAPIVersion.VERSION1, client_id=client_id)

    # Set callback functions
    client.on_connect = on_connect
    client.on_message = on_message

     # Configure certificates
    client.tls_set(ca_certs=rootCa, certfile=thingCert, keyfile=privKey, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)

    # Connect to MQTT broker
    connected = False
    while not connected:
        try:
            print("Attempting to connect to MQTT broker...")
            client.connect(broker_address, broker_port)
            connected = True
            print("Successfully connected to MQTT broker")
        except TimeoutError as e:
            print("Connection attempt timed out. Retrying in 5 seconds...")
            sleep(5)  # Wait for 5 seconds before retrying

    client.loop_start()

    while True:
        humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
        # Get current timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        if humidity is not None and temperature is not None:
            print('Temp={0:0.1f}°C  Humidity={1:0.1f}%'.format(temperature, humidity))

            # Crea un diccionario y asigna los valores
            data = {
                "timestamp": timestamp,
                "device": device,
                "humidity": humidity,
                "temperature": temperature
            }

            # Publish data to the output topic
            try:
                payload = json.dumps(data)
                client.publish(topic, payload, qos=1)
            except Exception as e:
                print("Error al publicar en el topic:", topic)
                print("Error:", e)
        else:
            print('Failed to get reading. Try again!')