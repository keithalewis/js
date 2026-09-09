# Use bash for better scripting
SHELL := /bin/bash

# Directories
SRC_DIR := src
TEST_DIR := test

# Find all test files
TEST_FILES := $(shell find $(TEST_DIR) -name '*.t.ts')

# Default target
.PHONY: test
test:
	@echo "Running TypeScript tests..."
	@node --loader tsx --test $(TEST_FILES)

# Optional: watch mode (manual loop)
.PHONY: watch
watch:
	@echo "Watching for changes..."
	@while true; do \
        inotifywait -e modify -r $(SRC_DIR) $(TEST_DIR); \
        make test; \
    done

# Optional: lint target
.PHONY: lint
lint:
	npx tsc --noEmit

