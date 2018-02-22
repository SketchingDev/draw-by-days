package com.drawbydays.website;

import com.drawbydays.website.model.Image;
import com.drawbydays.website.storage.ImageEntity;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public final class ImageEntityToImageConverter implements Converter<ImageEntity, Image> {

  @Override
  public Image convert(ImageEntity imageEntity) {
    return new Image(
            imageEntity.getId(),
            imageEntity.getUri()
    );
  }
}