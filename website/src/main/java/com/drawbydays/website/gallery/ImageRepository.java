package com.drawbydays.website.gallery;

import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface ImageRepository extends Repository<Image, Long> {

  Optional<Image> findById(Long id);
  Optional<Image> findFirstByOrderByIdAsc();
  Optional<Image> findByIdGreaterThanOrderByIdAsc(Long id);
  void save(Iterable<Image> entities);
  Image save(Image owner);

  default Optional<Image> findNextElseFirstByOrderByIdAsc(Long id) {
    final Optional<Image> image = findByIdGreaterThanOrderByIdAsc(id);

    if (image.isPresent()) {
      return image;
    } else {
      return findFirstByOrderByIdAsc();
    }
  }
}