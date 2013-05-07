
/**
 * @type {Object} The namespace you want MeasurementJs to be available under, `window` by default
 */
var mJsNamespace = mJsNamespace || window;

/**
 * Measurement.Js
 * 
 * Unit-of-Measure conversion made easy.
 * 
 * @author Philipp Austermann
 * @version 0.1
 * @example text measurementJs.convert(3.5).from(DISTANCE.KMH).to(DISTANCE.M); or  measurementJs.convert(3.5).from(DISTANCE.KMH).to(DISTANCE.M);
 * 
 * @param {Object} namespace
 * @returns {undefined}
 */
(function(namespace) {

	namespace.measurement = MeasurementJs;
	namespace.measurement.Converter = MeasurementConverter;

	namespace.mJs = namespace.MeasurementJs;

	namespace.measurement.Unit = {
		Speed: {
			MILES_PER_HOUR: 'mph',
			KILOMETRE_PER_HOUR: 'km/h',
			METRE_PER_SECOND: 'm/s',
			KNOT: 'kn'
		},
		Distance: {
			KILOMETRES: 'km',
			MILES: 'M',
			METRES: 'm',
			YARDS: 'y'
		},
		Pressure: {
			HECTOPASCAL: 'hPa',
			PASCAL: 'Pa',
			BAR: 'bar'
		}
	};

	var speedUnit = namespace.measurement.Unit.Speed,
		pressureUnit = namespace.measurement.Unit.Pressure,
		DEFINITIONS = {
		Speed: {
			'mph': {
				key: speedUnit.MILES_PER_HOUR,
				base: speedUnit.KILOMETRE_PER_HOUR,
				factor: 1.609344
			},
			'km/h': {
				key: speedUnit.KILOMETRE_PER_HOUR,
				base: null
			},
			'm/s': {
				key: speedUnit.METRE_PER_SECOND,
				base: speedUnit.KILOMETRE_PER_HOUR,
				factor: 3.6
			},
			'kn': {
				key: speedUnit.KNOT,
				base: speedUnit.KILOMETRE_PER_HOUR,
				factor: 1.852
			}
		},
		Distance: {
			'km': {
				base: 'm',
				factor: 1000,
				name: {
					de: 'Kilometer',
					en: 'Kilometer',
					en_GB: 'Kilometre'
				},
				plural: {
					en: 'Kilometers',
					en_GB: 'Kilometres'
				}
			},
			'm': {
				base: null, // equals factor of 1
				name: {
					de: 'Meter',
					en: 'Meter',
					en_GB: 'Metre'
				},
				plural: {
					en: 'Meters',
					en_GB: 'Metres'
				}
			}
		},
		Pressure: {
			'hPa': {
				key: pressureUnit.HECTOPASCAL,
				base: 'Pa',
				factor: 100,
				name: {
					de: 'Hektopascal',
					en: 'Hectopascal',
					en_GB: 'Hectopascal'
				},
				plural: {
					en: 'Hectopascals'
				}
			},
			'Pa': {
				key: pressureUnit.PASCAL,
				base: null,
				name: {
					de: 'Pascal',
					en: 'Pascal',
					en_GB: 'Pascal'
				},
				plural: {
					en: 'Pascals'
				}
			},
			'bar': {
				key: pressureUnit.BAR,
				base: 'Pa',
				factor: 1000000,
				name: {
					de: 'Bar',
					en: 'Bar',
					en_GB: 'Bar'
				},
				plural: {
					en: 'Bars'
				}
			}
		}
	};

	function MeasurementConverter(unitType) {
		var inputUnit = null,
			outputUnit = null,
			self = this;

		this.convert = function(value) {

			if (DEFINITIONS[unitType]) {
				var inputDef = DEFINITIONS[unitType][inputUnit],
					outputDef = DEFINITIONS[unitType][outputUnit];
				if (inputDef && outputDef) {

					if (inputDef.base === outputUnit) {
						return value * inputDef.factor;
					} else if (inputDef.key === outputDef.base) {
						return value / outputDef.factor;
					} else {
						// We're here b/c neither input nor out type is base type to which we could directly convert

						/**
						 * TODO use direct reconversion factors, while trading off the higher accuracy / performance
						 * vs. larger configuration array/file size 
						 */
						var baseType = inputDef.base || outputDef.base, baseValue;
						if (baseType === inputDef.base) {
							baseValue = MeasurementJs(unitType).convert(value).from(inputDef.key).to(inputDef.base);
							inputUnit = inputDef.base;
						} else if (baseType === outputDef.base) {
							baseValue = MeasurementJs(unitType).convert(value).from(outputDef.key).to(outputDef.base);
							inputUnit = outputDef.base;
						}
						if (typeof baseType === 'undefined')
							return false;

						return self.convert(baseValue);
					}
				}
			}

			return false;
		};

		this.inputUnit = null;
		this.setInputUnit = function(unit) {
			inputUnit = unit || null;
			this.inputUnit = inputUnit;

			return self;
		};

		this.outputUnit = null;
		this.setOutputUnit = function(unit) {
			outputUnit = unit || null;
			this.outputUnit = outputUnit;

			return self;
		};
	}

	function MeasurementJs(UnitType) {
		var self = this;
		/**
		 * 
		 * @param {type} value
		 * @returns {MeasurementConverter}
		 */
		this.convert = function(value) {
			var valueToConvert = value,
				converter = new MeasurementConverter(UnitType);

			function readyToConvert() {
				return converter.inputUnit !== null && converter.outputUnit !== null;
			}

			var easyApiConverter = {
				from: function(inputUnit) {
					converter.setInputUnit(inputUnit);
					if (readyToConvert())
						return converter.convert(valueToConvert);

					return this;
				},
				to: function(outputUnit) {
					converter.setOutputUnit(outputUnit);
					if (readyToConvert())
						return converter.convert(valueToConvert);

					return this;
				}
			};

			return easyApiConverter;
		};
		return {
			convert: self.convert
		};
	}

})(mJsNamespace);
