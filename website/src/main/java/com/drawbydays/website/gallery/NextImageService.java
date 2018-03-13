package com.drawbydays.website.gallery;

import com.drawbydays.website.gallery.model.Image;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class NextImageService {

  private final ImageRepository imageRepository;

  private final Converter<ImageEntity, Image> converter;

  @Autowired
  NextImageService(final ImageRepository imageRepository, final Converter<ImageEntity, Image> converter) {
    this.imageRepository = Objects.requireNonNull(imageRepository);
    this.converter = Objects.requireNonNull(converter);
  }

  public Optional<Image> findNextImage(final Image image) {
    Objects.requireNonNull(image);

    return imageRepository.findNextElseFirstByOrderByIdAsc(image.getId())
            .map(converter::convert);
  }
}
