package com.drawbydays.website.gallery;

import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ImageRepository extends Repository<Image, Long> {

  Optional<Image> findById(Long id);
  Optional<Image> findFirstByOrderByIdAsc();
  Iterable<Image> findAllByOrderByIdAsc();
  Image save(Image owner);
  Iterable<Image> save(Iterable<Image> entities);

  default Optional<Image> findNextElseFirstByOrderByIdAsc(Long id) {
    final Iterable<Image> images = this.findAllByOrderByIdAsc();

    Image firstImage = null;
    for (final Image image : images) {
      if (firstImage == null) {
        firstImage = image;
      }

      if (image.getId() > id) {
        return Optional.of(image);
      }
    }

    return Optional.ofNullable(firstImage);
  }
}