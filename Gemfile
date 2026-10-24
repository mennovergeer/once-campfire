source "https://rubygems.org"

git_source(:github) { |repo| "https://github.com/#{repo}.git" }
git_source(:bc)     { |repo| "https://github.com/basecamp/#{repo}" }

# Rails
gem "rails", "~> 8.1.0", ">= 8.1.3.1"

# Drivers
gem "sqlite3", "~> 2.7"
gem "redis", "~> 5.4"

# Deployment
gem "puma", "~> 7.1"

# Jobs
gem "resque", "~> 2.7.0"
gem "resque-pool", "~> 0.7.1"

# Assets
gem "propshaft", "~> 1.2"
gem "importmap-rails", "~> 2.2"

# Hotwire
gem "turbo-rails", "~> 2.0"
gem "stimulus-rails"

# Media handling
gem "image_processing", "~> 2.2"
gem "ruby-vips", "~> 2.2"

# Telemetry
gem "sentry-ruby"
gem "sentry-rails"

# Other
gem "bcrypt"
gem "web-push"
gem "rqrcode"
gem "rails_autolink"
gem "geared_pagination"
gem "jbuilder"
gem "net-http-persistent"
gem "kredis"
gem "platform_agent"
gem "thruster"

group :development, :test do
  gem "debug"
  gem "rubocop-rails-omakase", require: false
  gem "faker", require: false
  gem "brakeman", require: false
end

group :test do
  gem "minitest", "~> 5.27"
  gem "capybara"
  gem "mocha"
  gem "selenium-webdriver"
  gem "webmock", require: false
end
