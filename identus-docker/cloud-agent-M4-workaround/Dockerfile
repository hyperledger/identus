FROM docker.io/identus/identus-cloud-agent:1.40.0

USER root
RUN sed -i -e 's/"\$java_cmd"/"\$java_cmd" -XX:UseSVE=0/g' ./bin/identus-cloud-agent
USER demiourgos728
