package com.drawbydays.website.populate;

import com.drawbydays.website.gallery.ImageEntity;
import org.springframework.boot.context.properties.ConfigurationPropertiesBinding;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.net.URI;

@Component
@ConfigurationPropertiesBinding
public final class StringToImageEntityConverter implements Converter<String, ImageEntity> {

  @Override
  public ImageEntity convert(final String uri) {
    return new ImageEntity(URI.create(uri));
  }
}