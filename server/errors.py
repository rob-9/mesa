"""shared exception types and fastapi handlers. populated as needed."""


class SummerError(Exception):
    """base for domain errors."""


class IdentityError(SummerError): ...


class SchemaError(SummerError): ...


class PolicyError(SummerError): ...


class StateError(SummerError): ...
