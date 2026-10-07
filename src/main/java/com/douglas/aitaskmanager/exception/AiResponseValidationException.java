package com.douglas.aitaskmanager.exception;

public class AiResponseValidationException
        extends RuntimeException {

    public AiResponseValidationException(
            String message
    ) {
        super(message);
    }
}