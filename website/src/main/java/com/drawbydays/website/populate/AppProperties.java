package com.drawbydays.website.populate;

import com.drawbydays.website.gallery.Image;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix="app")
public class AppProperties {

  private final List<Image> images = new ArrayList<>();

  public void setImage(final Image image) {
    images.add(image);
  }

  public List<Image> getImages() {
    return this.images;
  }
}
