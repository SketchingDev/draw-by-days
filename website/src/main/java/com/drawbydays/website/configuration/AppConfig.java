package com.drawbydays.website.configuration;

import com.drawbydays.website.ImageEntityToImageConverter;
import com.drawbydays.website.storage.ImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Locale;

@Configuration
@ComponentScan("com.drawbydays.website")
public class AppConfig {

  private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);

  @Bean
  public LocaleResolver localeResolver() {
    final AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
    localeResolver.setDefaultLocale(Locale.UK);
    return localeResolver;
  }

  @Bean
  public CommandLineRunner data(final AppProperties appProperties, final ImageRepository repository) {
    return (args) -> {
      logger.info("Initialising data");
      repository.save(appProperties.getImages());
    };
  }
}
