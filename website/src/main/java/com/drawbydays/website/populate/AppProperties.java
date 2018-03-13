package com.drawbydays.website.populate;

import com.drawbydays.website.gallery.ImageEntity;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix="app")
public class AppProperties {

  private final List<ImageEntity> images = new ArrayList<>();

  public void setImage(final ImageEntity image) {
    images.add(image);
  }

  public List<ImageEntity> getImages() {
    return this.images;
  }
}
