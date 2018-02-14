package com.drawbydays.website.storage;

import java.util.Optional;

public interface ImageRepository {

  Optional<Image> getRandomImage();
}
