package com.drawbydays.website.gallery;

import com.drawbydays.website.gallery.model.Image;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class ImageService {

  private final ImageRepository imageRepository;

  private final Converter<ImageEntity, Image> converter;

  @Autowired
  ImageService(final ImageRepository imageRepository, final Converter<ImageEntity, Image> converter) {
    this.imageRepository = Objects.requireNonNull(imageRepository);
    this.converter = Objects.requireNonNull(converter);
  }

  public Optional<Image> findFistImage() {
    return imageRepository.findFirstByOrderByIdAsc().map(converter::convert);
  }

  public Optional<Image> findImageById(final long id) {
    return imageRepository.findById(id).map(converter::convert);
  }
}
