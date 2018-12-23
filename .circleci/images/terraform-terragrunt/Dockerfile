FROM alpine:3.8

# Custom

COPY terragrunt-output-to-env.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/terragrunt-output-to-env.sh

# Terraform

ENV TERRAFORM_VERSION=0.11.11

RUN apk update && \
    apk add bash ca-certificates git openssl unzip wget && \
    cd /tmp && \
    wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm -rf /tmp/* && \
    rm -rf /var/cache/apk/* && \
    rm -rf /var/tmp/*


# Terragrunt

ENV TERRAGRUNT_VERSION=0.17.3
ENV TERRAGRUNT_TFPATH=/usr/bin/terraform

RUN wget https://github.com/gruntwork-io/terragrunt/releases/download/v$TERRAGRUNT_VERSION/terragrunt_linux_386 -O /usr/bin/terragrunt && \
    chmod +x /usr/bin/terragrunt

# AWS CLI

RUN apk add python python-dev py-pip build-base && \
    pip install awscli
