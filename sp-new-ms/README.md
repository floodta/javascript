# Shared Plan Get Configuration Details Micro-service

## To get source code

````````````````````
cd Code
git clone git@git.tecnotree.com:asa/sp-get-details-handler.git
cd sp-get-details-handler
git checkout develop
npm config set registry http://npm.tecnotree.com
npm install
````````````````````
**Note**: Phase 2 version uses redis database for Shared Plan data models!  

## To install redis (if not yet done)

As tecnotree user
````````````````````
sudo wget http://download.redis.io/releases/redis-3.0.5.tar.gz

````````````````````

After expanding the tar you can have a README file. It contains the install procedure. Which is simply as below.
````````````````````
make install
mkdir /etc/redis
sudo cp /home/tecnotree/redis-3.0.5/redis.conf /etc/redis/6379.conf
redis-server /etc/redis/6379.conf &
````````````````````

## To run Unit Tests

### Run Zoo-keeper and Kafka broker

````````````````````
cd "/opt/kafka_2.11-0.10.0.0/" 
bin/zookeeper-server-start.sh -daemon config/zookeeper.properties
bin/kafka-server-start.sh -daemon config/server.properties
````````````````````

### Create kafka topics (if not yet done)

````````````````````
cd "/opt/kafka_2.11-0.10.0.0/"
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic requestSpDetails
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic responseSpDetails
````````````````````

### Open Console#1 to run sp-get-details-handler micro-service with debug traces

````````````````````
cd Code
cd sp-get-details-handler
npm install
LLEVEL=debug node src/main
````````````````````

### Open Console#2 to run Unit Test test cases with debug traces

````````````````````
cd Code
cd sp-get-details-handler
LLEVEL=debug node_modules/mocha/bin/mocha
````````````````````
(Test results are generated in ~/report.html file)

# For Vagrant images, please use the following:
sudo /usr/bin/zookeeper-server-start -daemon /etc/kafka/zookeeper.properties

sudo /usr/bin/kafka-server-start -daemon /etc/kafka/server.properties

/usr/bin/kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic requestSpDetails

/usr/bin/kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic responseSpDetails

# First Build the Docker image
cd sp-get-details-handler

sudo docker build -t sp-get-details-handler .

# Remove existing dockers
sudo docker rm redis

sudo docker rm sp-get-details-handler

sudo docker rm sp-get-details-handler-test
# Run the redis docker
sudo docker run -d --network=host --name redis -p:6379:6379 redis:alpine
# Run sp-get-details-handler MS
sudo docker run -d --network=host --name sp-get-details-handler sp-get-details-handler
# Run sp-get-details-handler Mocha tests
sudo docker run -d --network=host --name sp-get-details-handler-test sp-get-details-handler test

# To see the test results
sudo docker logs sp-get-details-handler-test
