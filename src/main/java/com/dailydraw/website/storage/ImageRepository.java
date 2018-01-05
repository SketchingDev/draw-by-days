package com.dailydraw.website.storage;

import java.util.Optional;

public interface ImageRepository {

  Optional<Image> getRandomImage();
}
