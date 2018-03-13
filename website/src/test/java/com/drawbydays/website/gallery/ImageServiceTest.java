package com.drawbydays.website.gallery;

import com.drawbydays.website.gallery.model.Image;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.convert.converter.Converter;

import java.util.Optional;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.same;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ImageServiceTest {

  private static final long IMAGE_ID = 0L;

  @Mock
  private Converter<ImageEntity, Image> converter;

  @Mock
  private ImageRepository imageRepository;

  private ImageService service;

  @Before
  public void setup() {
    service = new ImageService(imageRepository, converter);
  }

  @Test(expected = NullPointerException.class)
  public void nullPointerException_thrown_if_instantiated_with_null_imageRepository() {
    new ImageService(null, converter);
  }

  @Test(expected = NullPointerException.class)
  public void nullPointerException_thrown_if_instantiated_with_null_converter() {
    new ImageService(imageRepository, null);
  }

  @Test
  public void imageEntity_from_imageRepository_findFirstByOrderByIdAsc_passed_to_converter() {
    final ImageEntity imageEntity = mock(ImageEntity.class);
    when(imageRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(imageEntity));

    service.findFistImage();

    verify(converter).convert(same(imageEntity));
  }

  @Test
  public void imageEntity_from_imageRepository_findById_passed_to_converter() {
    final ImageEntity imageEntity = mock(ImageEntity.class);
    when(imageRepository.findById(any())).thenReturn(Optional.of(imageEntity));

    service.findImageById(IMAGE_ID);

    verify(converter).convert(same(imageEntity));
  }

  @Test
  public void id_passed_to_findImageById_passed_to_image_Repository() {
    when(imageRepository.findById(any())).thenReturn(Optional.empty());

    service.findImageById(IMAGE_ID);

    verify(imageRepository).findById(eq(IMAGE_ID));
  }
}
