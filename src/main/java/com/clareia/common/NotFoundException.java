package com.clareia.common;

/** Lancada quando um recurso solicitado nao existe (resulta em HTTP 404). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
