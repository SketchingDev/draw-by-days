package com.drawbydays.website.configuration;

import com.drawbydays.website.storage.ImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements ApplicationRunner {

  private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);

  private AppProperties appProperties;

  private ImageRepository imageRepository;

  @Autowired
  public DataLoader(final AppProperties appProperties, final ImageRepository imageRepository) {
    this.appProperties = appProperties;
    this.imageRepository = imageRepository;
  }

  @Override
  public void run(ApplicationArguments args) {
    logger.info("Initialising data");
    imageRepository.save(appProperties.getImages());
  }
}
