FROM alpine:3.20

ARG PB_VERSION=0.24.4

RUN apk add --no-cache wget unzip ca-certificates

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && unzip "pocketbase_${PB_VERSION}_linux_amd64.zip" -d /pb/ \
    && rm "pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && chmod +x /pb/pocketbase

COPY pocketbase/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /pb

EXPOSE 8090

ENTRYPOINT ["/entrypoint.sh"]
