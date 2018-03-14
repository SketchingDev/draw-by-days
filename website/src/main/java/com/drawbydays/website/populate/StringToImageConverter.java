package com.drawbydays.website.populate;

import com.drawbydays.website.gallery.Image;
import org.springframework.boot.context.properties.ConfigurationPropertiesBinding;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.net.URI;

@Component
@ConfigurationPropertiesBinding
public final class StringToImageConverter implements Converter<String, Image> {

  @Override
  public Image convert(final String uri) {
    return new Image(URI.create(uri));
  }
}