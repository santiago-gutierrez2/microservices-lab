package com.microlab.order.service.input;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderRequest(@NotNull Long productId,
                           @NotNull @Positive Integer quantity) {
}
