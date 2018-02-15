FROM cychainprotocol/centos7-jdk8
MAINTAINER cychainprotocol

# Install dependencies && Download java-cychain
RUN yum update -y && \
	yum install -y git && \
	git clone https://github.com/CYChain/cychain/java-cychain.git /home/java-cychain

# Change work directory
WORKDIR /home/java-cychain

