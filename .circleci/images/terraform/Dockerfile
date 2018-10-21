FROM alpine:3.8-alpine

# Terraform

ENV TERRAFORM_VERSION=0.11.8

RUN apk update && \
    apk add bash ca-certificates git openssl unzip wget && \
    cd /tmp && \
    wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin && \
    rm -rf /tmp/* && \
    rm -rf /var/cache/apk/* && \
    rm -rf /var/tmp/*


# Terragrunt

ENV TERRAGRUNT_VERSION=0.17.0
ENV TERRAGRUNT_TFPATH=/usr/bin/terraform

RUN wget https://github.com/gruntwork-io/terragrunt/releases/download/v$TERRAGRUNT_VERSION/terragrunt_linux_386 -O /usr/bin/terragrunt && \
    chmod +x /usr/bin/terragrunt
