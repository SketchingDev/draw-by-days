package com.drawbydays.website.storage;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;

public interface ImageRepository extends CrudRepository<ImageEntity, Long> {

  Optional<ImageEntity> findById(Long id);
  Optional<ImageEntity> findFirstByOrderByIdAsc();
  Iterable<ImageEntity> findAllByOrderByIdAsc();

  default Optional<ImageEntity> findNextElseFirstByOrderByIdAsc(Long id) {
    final Iterable<ImageEntity> images = this.findAllByOrderByIdAsc();

    ImageEntity firstImage = null;
    for (final ImageEntity image : images) {
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