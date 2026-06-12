# ===============================================
# Stage 1: Base production image
# ===============================================
FROM php:8.3-apache AS production-base

# Install system dependencies and PHP extensions in one layer
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libjpeg-progs \
    webp \
    libmcrypt-dev \
    --no-install-recommends \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) mysqli pdo_mysql gd \
  && a2enmod rewrite \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ===============================================
# Stage 2: Development image (with debug tools)
# ===============================================
FROM production-base AS development

# Install development tools and Xdebug
RUN apt-get update && apt-get install -y \
    vim \
    curl \
    --no-install-recommends \
  && pecl install xdebug-3.3.2 \
  && docker-php-ext-enable xdebug \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install MailHog for email testing in development
RUN curl --location --output /usr/local/bin/mhsendmail \
    https://github.com/mailhog/mhsendmail/releases/download/v0.2.0/mhsendmail_linux_amd64 \
  && chmod +x /usr/local/bin/mhsendmail

# Configure MailHog
RUN echo 'sendmail_path="/usr/local/bin/mhsendmail --smtp-addr=mailhog:1025 --from=no-reply@docker.dev"' \
    > /usr/local/etc/php/conf.d/mailhog.ini

# Copy configuration files
COPY ./php.ini /usr/local/etc/php/
COPY ./apache2.conf /etc/apache2/conf-enabled/

# ===============================================
# Stage 3: Production image (minimal)
# ===============================================
FROM production-base AS production

# Copy only production configuration
COPY ./php.ini /usr/local/etc/php/
COPY ./apache2.conf /etc/apache2/conf-enabled/

# Remove MailHog configuration for production
RUN rm -f /usr/local/etc/php/conf.d/mailhog.ini
