package com.drawbydays.website.gallery;

import com.drawbydays.website.gallery.model.Image;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public final class ImageEntityToImageConverter implements Converter<ImageEntity, Image> {

  @Override
  public Image convert(final ImageEntity imageEntity) {
    return new Image(
            imageEntity.getId(),
            imageEntity.getUri()
    );
  }
}