package com.drawbydays.website;

import com.drawbydays.website.model.Image;
import com.drawbydays.website.storage.ImageEntity;
import com.drawbydays.website.storage.ImageRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.convert.converter.Converter;

import java.util.Optional;

import static junit.framework.TestCase.assertNull;
import static junit.framework.TestCase.assertSame;
import static junit.framework.TestCase.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class NextImageServiceTest {

  private static final long IMAGE_ID = 123L;

  @Mock
  private Converter<ImageEntity, Image> converter;

  @Mock
  private ImageRepository imageRepository;

  private NextImageService service;

  @Before
  public void setup() {
    service = new NextImageService(imageRepository, converter);
  }

  @Test(expected = NullPointerException.class)
  public void nullPointerException_thrown_if_instantiated_with_null_imageRepository() {
    new NextImageService(null, converter);
  }

  @Test(expected = NullPointerException.class)
  public void nullPointerException_thrown_if_instantiated_with_null_converter() {
    new NextImageService(imageRepository, null);
  }

  @Test(expected = NullPointerException.class)
  public void nullPointerException_thrown_null_image_passed_to_findNextImage() {
    service.findNextImage(null);
  }

  @Test
  public void image_id_passed_to_imageRepository_findNextElseFirstByOrderByIdAsc() {
    final Image image = mock(Image.class);
    when(image.getId()).thenReturn(IMAGE_ID);

    when(imageRepository.findNextElseFirstByOrderByIdAsc(any())).thenReturn(Optional.empty());

    service.findNextImage(image);

    verify(imageRepository).findNextElseFirstByOrderByIdAsc(eq(IMAGE_ID));
  }

  @Test
  public void imageEntity_from_imageRepository_passed_to_conversion_service() {
    final ImageEntity imageEntity = mock(ImageEntity.class);
    when(imageRepository.findNextElseFirstByOrderByIdAsc(any())).thenReturn(Optional.of(imageEntity));

    service.findNextImage(mock(Image.class));

    verify(converter).convert(same(imageEntity));
  }

  @Test
  public void findNextImage_returns_image_from_conversion_service() {
    final Image image = mock(Image.class);
    when(converter.convert(any())).thenReturn(image);

    when(imageRepository.findNextElseFirstByOrderByIdAsc(any())).thenReturn(Optional.of(mock(ImageEntity.class)));

    final Optional<Image> nextImage = service.findNextImage(mock(Image.class));

    assertTrue(nextImage.isPresent());
    assertSame(image, nextImage.get());
  }
}
